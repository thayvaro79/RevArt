using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RevArt.Core.Entities;
using RevArt.Infrastructure.Data;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RevArtDbContext _db;

    public UsersController(UserManager<ApplicationUser> userManager, RevArtDbContext db)
    {
        _userManager = userManager;
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsers()
    {
        var currentUser = await _userManager.GetUserAsync(User);

        if (currentUser is null)
        {
            return Unauthorized();
        }

        var users = await _db.Users
            .AsNoTracking()
            .Where(u => u.TenantId == currentUser.TenantId)
            .OrderBy(u => u.Email)
            .ToListAsync();

        var teamMemberIds = users.Where(u => u.TeamMemberId.HasValue).Select(u => u.TeamMemberId!.Value).ToList();

        var teamMembers = await _db.TeamMembers
            .AsNoTracking()
            .Where(t => teamMemberIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id);

        var responses = new List<UserResponse>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            responses.Add(new UserResponse
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                DisplayName = user.DisplayName,
                IsActive = user.IsActive,
                Roles = roles.ToList(),
                TeamMemberId = user.TeamMemberId,
                TeamMemberName = user.TeamMemberId.HasValue && teamMembers.TryGetValue(user.TeamMemberId.Value, out var tm)
                    ? tm.Name
                    : null
            });
        }

        return Ok(responses);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponse>> GetUser(int id)
    {
        var currentUser = await _userManager.GetUserAsync(User);

        if (currentUser is null)
        {
            return Unauthorized();
        }

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id && u.TenantId == currentUser.TenantId);

        if (user is null)
        {
            return NotFound();
        }

        var roles = await _userManager.GetRolesAsync(user);

        string? teamMemberName = null;

        if (user.TeamMemberId.HasValue)
        {
            teamMemberName = await _db.TeamMembers
                .AsNoTracking()
                .Where(t => t.Id == user.TeamMemberId.Value)
                .Select(t => t.Name)
                .FirstOrDefaultAsync();
        }

        return Ok(new UserResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            DisplayName = user.DisplayName,
            IsActive = user.IsActive,
            Roles = roles.ToList(),
            TeamMemberId = user.TeamMemberId,
            TeamMemberName = teamMemberName
        });
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request)
    {
        var currentUser = await _userManager.GetUserAsync(User);

        if (currentUser is null)
        {
            return Unauthorized();
        }

        var email = (request.Email ?? string.Empty).Trim();

        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest("Email is required.");
        }

        var roles = (request.Roles ?? new List<string>())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (roles.Count == 0 || roles.Any(r => !ValidRoles.Contains(r, StringComparer.OrdinalIgnoreCase)))
        {
            return BadRequest("At least one valid role (Admin or Editor) is required.");
        }

        var existing = await _userManager.FindByEmailAsync(email);

        if (existing is not null)
        {
            return BadRequest("A user with this email already exists.");
        }

        int? teamMemberId = null;

        if (request.TeamMemberMode == TeamMemberLinkMode.Link)
        {
            if (request.TeamMemberId is null)
            {
                return BadRequest("TeamMemberId is required to link an existing team member.");
            }

            var teamMember = await _db.TeamMembers
                .FirstOrDefaultAsync(t => t.Id == request.TeamMemberId && t.TenantId == currentUser.TenantId);

            if (teamMember is null)
            {
                return BadRequest("Team member not found.");
            }

            var alreadyLinked = await _db.Users.AnyAsync(u => u.TeamMemberId == teamMember.Id);

            if (alreadyLinked)
            {
                return BadRequest("This team member is already linked to another user.");
            }

            teamMemberId = teamMember.Id;
        }
        else if (request.TeamMemberMode == TeamMemberLinkMode.Create)
        {
            if (request.NewTeamMember is null || string.IsNullOrWhiteSpace(request.NewTeamMember.Name))
            {
                return BadRequest("Team member name is required.");
            }

            var slug = string.IsNullOrWhiteSpace(request.NewTeamMember.Slug)
                ? Slugify(request.NewTeamMember.Name)
                : Slugify(request.NewTeamMember.Slug);

            var slugTaken = await _db.TeamMembers
                .AnyAsync(t => t.TenantId == currentUser.TenantId && t.Slug == slug);

            if (slugTaken)
            {
                return BadRequest("A team member with this slug already exists.");
            }

            var newTeamMember = new TeamMember
            {
                TenantId = currentUser.TenantId,
                Name = request.NewTeamMember.Name,
                Slug = slug,
                Title = request.NewTeamMember.Title,
                Bio = request.NewTeamMember.Bio,
                PhotoUrl = request.NewTeamMember.PhotoUrl,
                SortOrder = request.NewTeamMember.SortOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.TeamMembers.Add(newTeamMember);
            await _db.SaveChangesAsync();

            teamMemberId = newTeamMember.Id;
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            TenantId = currentUser.TenantId,
            TeamMemberId = teamMemberId,
            DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? null : request.DisplayName,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);

        if (!createResult.Succeeded)
        {
            return BadRequest(string.Join(" ", createResult.Errors.Select(e => e.Description)));
        }

        await _userManager.AddToRolesAsync(user, roles);

        var response = new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            IsActive = user.IsActive,
            Roles = roles,
            TeamMemberId = user.TeamMemberId,
            TeamMemberName = request.TeamMemberMode == TeamMemberLinkMode.Create
                ? request.NewTeamMember?.Name
                : null
        };

        return CreatedAtAction(nameof(GetUsers), null, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UserResponse>> UpdateUser(int id, UpdateUserRequest request)
    {
        var currentUser = await _userManager.GetUserAsync(User);

        if (currentUser is null)
        {
            return Unauthorized();
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == currentUser.TenantId);

        if (user is null)
        {
            return NotFound();
        }

        var roles = (request.Roles ?? new List<string>())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (roles.Count == 0 || roles.Any(r => !ValidRoles.Contains(r, StringComparer.OrdinalIgnoreCase)))
        {
            return BadRequest("At least one valid role (Admin or Editor) is required.");
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        var isSelf = user.Id == currentUser.Id;
        var willRemainAdmin = roles.Contains("Admin", StringComparer.OrdinalIgnoreCase);

        if (isSelf && currentRoles.Contains("Admin", StringComparer.OrdinalIgnoreCase) && !willRemainAdmin)
        {
            var otherAdminExists = (await _userManager.GetUsersInRoleAsync("Admin"))
                .Any(u => u.Id != user.Id);

            if (!otherAdminExists)
            {
                return BadRequest("You cannot remove your own Admin role — you are the only Admin.");
            }
        }

        if (isSelf && !request.IsActive)
        {
            return BadRequest("You cannot deactivate your own account.");
        }

        int? teamMemberId = user.TeamMemberId;

        if (request.TeamMemberMode == TeamMemberLinkMode.None)
        {
            teamMemberId = null;
        }
        else if (request.TeamMemberMode == TeamMemberLinkMode.Link)
        {
            if (request.TeamMemberId is null)
            {
                return BadRequest("TeamMemberId is required to link an existing team member.");
            }

            var teamMember = await _db.TeamMembers
                .FirstOrDefaultAsync(t => t.Id == request.TeamMemberId && t.TenantId == currentUser.TenantId);

            if (teamMember is null)
            {
                return BadRequest("Team member not found.");
            }

            var alreadyLinked = await _db.Users
                .AnyAsync(u => u.TeamMemberId == teamMember.Id && u.Id != user.Id);

            if (alreadyLinked)
            {
                return BadRequest("This team member is already linked to another user.");
            }

            teamMemberId = teamMember.Id;
        }
        else if (request.TeamMemberMode == TeamMemberLinkMode.Create)
        {
            if (request.NewTeamMember is null || string.IsNullOrWhiteSpace(request.NewTeamMember.Name))
            {
                return BadRequest("Team member name is required.");
            }

            var slug = string.IsNullOrWhiteSpace(request.NewTeamMember.Slug)
                ? Slugify(request.NewTeamMember.Name)
                : Slugify(request.NewTeamMember.Slug);

            var slugTaken = await _db.TeamMembers
                .AnyAsync(t => t.TenantId == currentUser.TenantId && t.Slug == slug);

            if (slugTaken)
            {
                return BadRequest("A team member with this slug already exists.");
            }

            var newTeamMember = new TeamMember
            {
                TenantId = currentUser.TenantId,
                Name = request.NewTeamMember.Name,
                Slug = slug,
                Title = request.NewTeamMember.Title,
                Bio = request.NewTeamMember.Bio,
                PhotoUrl = request.NewTeamMember.PhotoUrl,
                SortOrder = request.NewTeamMember.SortOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.TeamMembers.Add(newTeamMember);
            await _db.SaveChangesAsync();

            teamMemberId = newTeamMember.Id;
        }

        user.DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? null : request.DisplayName;
        user.IsActive = request.IsActive;
        user.TeamMemberId = teamMemberId;

        await _db.SaveChangesAsync();

        var rolesToRemove = currentRoles.Except(roles, StringComparer.OrdinalIgnoreCase).ToList();
        var rolesToAdd = roles.Except(currentRoles, StringComparer.OrdinalIgnoreCase).ToList();

        if (rolesToRemove.Count > 0)
        {
            await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
        }

        if (rolesToAdd.Count > 0)
        {
            await _userManager.AddToRolesAsync(user, rolesToAdd);
        }

        var teamMemberName = teamMemberId.HasValue
            ? await _db.TeamMembers.AsNoTracking()
                .Where(t => t.Id == teamMemberId)
                .Select(t => t.Name)
                .FirstOrDefaultAsync()
            : null;

        return Ok(new UserResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            DisplayName = user.DisplayName,
            IsActive = user.IsActive,
            Roles = roles,
            TeamMemberId = user.TeamMemberId,
            TeamMemberName = teamMemberName
        });
    }

    [HttpPut("{id:int}/active")]
    public async Task<IActionResult> SetUserActive(int id, SetUserActiveRequest request)
    {
        var currentUser = await _userManager.GetUserAsync(User);

        if (currentUser is null)
        {
            return Unauthorized();
        }

        if (currentUser.Id == id && !request.IsActive)
        {
            return BadRequest("You cannot deactivate your own account.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == currentUser.TenantId);

        if (user is null)
        {
            return NotFound();
        }

        user.IsActive = request.IsActive;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static readonly string[] ValidRoles = { "Admin", "Editor" };

    private static string Slugify(string? value)
    {
        var input = (value ?? string.Empty).Trim().ToLowerInvariant();
        var slug = Regex.Replace(input, "[^a-z0-9]+", "-").Trim('-');
        return slug;
    }
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TeamMemberLinkMode
{
    None,
    Link,
    Create
}

public class CreateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public List<string> Roles { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public TeamMemberLinkMode TeamMemberMode { get; set; } = TeamMemberLinkMode.None;
    public int? TeamMemberId { get; set; }
    public NewTeamMemberRequest? NewTeamMember { get; set; }
}

public class NewTeamMemberRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? PhotoUrl { get; set; }
    public int SortOrder { get; set; }
}

public class UpdateUserRequest
{
    public string? DisplayName { get; set; }
    public List<string> Roles { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public TeamMemberLinkMode TeamMemberMode { get; set; } = TeamMemberLinkMode.None;
    public int? TeamMemberId { get; set; }
    public NewTeamMemberRequest? NewTeamMember { get; set; }
}

public class SetUserActiveRequest
{
    public bool IsActive { get; set; }
}

public class UserResponse
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public bool IsActive { get; set; }
    public List<string> Roles { get; set; } = new();
    public int? TeamMemberId { get; set; }
    public string? TeamMemberName { get; set; }
}
