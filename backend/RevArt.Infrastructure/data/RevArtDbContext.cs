using Microsoft.EntityFrameworkCore;
using RevArt.Core.Entities;

namespace RevArt.Infrastructure.Data;

public class RevArtDbContext : DbContext
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

    public DbSet<Location> Locations => Set<Location>();

    public DbSet<Manufacturer> Manufacturers => Set<Manufacturer>();

    public DbSet<Inquiry> Inquiries => Set<Inquiry>();
}