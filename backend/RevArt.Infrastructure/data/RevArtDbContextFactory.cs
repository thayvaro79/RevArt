using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace RevArt.Infrastructure.Data;

public class RevArtDbContextFactory : IDesignTimeDbContextFactory<RevArtDbContext>
{
    public RevArtDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<RevArtDbContext>();

        optionsBuilder.UseSqlite(
            "Data Source=C:\\dev\\revart\\backend\\RevArt.Api\\Data\\revart.db");

        return new RevArtDbContext(optionsBuilder.Options);
    }
}