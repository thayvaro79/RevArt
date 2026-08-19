using Microsoft.AspNetCore.Identity;

namespace RevArt.Core.Entities;

public class ApplicationRole : IdentityRole<int>
{
    public ApplicationRole()
    {
    }

    public ApplicationRole(string roleName)
        : base(roleName)
    {
    }
}
