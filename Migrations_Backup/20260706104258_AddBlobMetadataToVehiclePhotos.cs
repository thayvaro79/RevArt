using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RevArt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBlobMetadataToVehiclePhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BlobName",
                table: "VehiclePhotos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "VehiclePhotos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedUtc",
                table: "VehiclePhotos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "VehiclePhotos",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "OriginalFileName",
                table: "VehiclePhotos",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BlobName",
                table: "VehiclePhotos");

            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "VehiclePhotos");

            migrationBuilder.DropColumn(
                name: "CreatedUtc",
                table: "VehiclePhotos");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "VehiclePhotos");

            migrationBuilder.DropColumn(
                name: "OriginalFileName",
                table: "VehiclePhotos");
        }
    }
}
