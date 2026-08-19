using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RevArt.Core.Entities;

namespace RevArt.Infrastructure.Data;

public class RevArtDbContext
    : IdentityDbContext<
        ApplicationUser,
        ApplicationRole,
        int,
        IdentityUserClaim<int>,
        IdentityUserRole<int>,
        IdentityUserLogin<int>,
        IdentityRoleClaim<int>,
        IdentityUserToken<int>>
{
    public RevArtDbContext(DbContextOptions<RevArtDbContext> options)
        : base(options)
    {
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();

    public DbSet<Vehicle> Vehicles => Set<Vehicle>();

    public DbSet<VehicleType> VehicleTypes => Set<VehicleType>();

    public DbSet<VehiclePhoto> VehiclePhotos => Set<VehiclePhoto>();

    public DbSet<VehicleDocument> VehicleDocuments => Set<VehicleDocument>();

    public DbSet<Lead> Leads => Set<Lead>();

    public DbSet<NewsletterSubscriber> NewsletterSubscribers => Set<NewsletterSubscriber>();

    public DbSet<PageHero> PageHeroes => Set<PageHero>();

    public DbSet<PageSection> PageSections => Set<PageSection>();

    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();

    public DbSet<TeamMemberPhoto> TeamMemberPhotos => Set<TeamMemberPhoto>();

    public DbSet<Location> Locations => Set<Location>();

    public DbSet<LocationPhoto> LocationPhotos => Set<LocationPhoto>();

    public DbSet<Manufacturer> Manufacturers => Set<Manufacturer>();

    public DbSet<Inquiry> Inquiries => Set<Inquiry>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity
                .HasOne(u => u.Tenant)
                .WithMany()
                .HasForeignKey(u => u.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(u => u.TenantId);

            entity
                .HasOne(u => u.TeamMember)
                .WithOne(t => t.User)
                .HasForeignKey<ApplicationUser>(u => u.TeamMemberId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(u => u.TeamMemberId).IsUnique();
        });
    }
}