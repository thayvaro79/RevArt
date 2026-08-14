using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RevArt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePageHeroFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ButtonText",
                table: "PageHeroes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ButtonUrl",
                table: "PageHeroes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "PageHeroes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EyebrowText",
                table: "PageHeroes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeroType",
                table: "PageHeroes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PageKey",
                table: "PageHeroes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ButtonText",
                table: "PageHeroes");

            migrationBuilder.DropColumn(
                name: "ButtonUrl",
                table: "PageHeroes");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "PageHeroes");

            migrationBuilder.DropColumn(
                name: "EyebrowText",
                table: "PageHeroes");

            migrationBuilder.DropColumn(
                name: "HeroType",
                table: "PageHeroes");

            migrationBuilder.DropColumn(
                name: "PageKey",
                table: "PageHeroes");
        }
    }
}
