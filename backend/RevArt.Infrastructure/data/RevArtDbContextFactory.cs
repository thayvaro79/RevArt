using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace RevArt.Infrastructure.Data;

public class RevArtDbContextFactory : IDesignTimeDbContextFactory<RevArtDbContext>
{
    public RevArtDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<RevArtDbContext>();

        //local sql server
        // optionsBuilder.UseSqlServer(
        //     "Server=(localdb)\\MSSQLLocalDB;Database=RevArt_Dev;Trusted_Connection=True;TrustServerCertificate=True;");

    optionsBuilder.UseSqlServer(
        "Server=tcp:revartsql79central.database.windows.net,1433;Initial Catalog=revart-db;Persist Security Info=False;User ID=revartadmin;Password=Abbott127#;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;");
            return new RevArtDbContext(optionsBuilder.Options);
    }
}