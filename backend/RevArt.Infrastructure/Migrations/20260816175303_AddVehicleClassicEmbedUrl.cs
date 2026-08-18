using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RevArt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleClassicEmbedUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClassicEmbedUrl",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClassicEmbedUrl",
                table: "Vehicles");
        }
    }
}
