using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RevArt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleDetailContentAndPhotoMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsPrimary",
                table: "VehiclePhotos",
                newName: "IsCover");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "VehiclePhotos",
                newName: "Role");

            migrationBuilder.RenameColumn(
                name: "Caption",
                table: "VehiclePhotos",
                newName: "AltText");

            migrationBuilder.AddColumn<string>(
                name: "ConditionReportText",
                table: "Vehicles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeroTagline",
                table: "Vehicles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HistoryText",
                table: "Vehicles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MarketNotes",
                table: "Vehicles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OverviewText",
                table: "Vehicles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TheCarText",
                table: "Vehicles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "VehiclePhotos",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "VehiclePhotos",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConditionReportText",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "HeroTagline",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "HistoryText",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "MarketNotes",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "OverviewText",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "TheCarText",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "VehiclePhotos");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "VehiclePhotos");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "VehiclePhotos",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "IsCover",
                table: "VehiclePhotos",
                newName: "IsPrimary");

            migrationBuilder.RenameColumn(
                name: "AltText",
                table: "VehiclePhotos",
                newName: "Caption");
        }
    }
}
