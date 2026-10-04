using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentravel.Migrations
{
    /// <inheritdoc />
    public partial class AddTours : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CultureTours",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nights = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LongDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Gallery = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Badge = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BadgeTone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Duration = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Transport = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TransportIcon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Badges = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoutePills = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuickSpecs = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Editorial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Itinerary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Inclusions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TravelNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SeatsTotal = table.Column<int>(type: "int", nullable: false),
                    SeoTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeoDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeoKeywords = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OgImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultBasePrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CultureTours", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CultureTours_TourCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "TourCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "DailyTours",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LongDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Gallery = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Badge = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BadgeTone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Duration = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Transport = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TransportIcon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Badges = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoutePills = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuickSpecs = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Editorial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Itinerary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Inclusions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TravelNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SeatsTotal = table.Column<int>(type: "int", nullable: false),
                    SeoTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeoDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeoKeywords = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OgImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultBasePrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyTours", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyTours_TourCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "TourCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CultureTours_CategoryId",
                table: "CultureTours",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CultureTours_IsActive_IsFeatured",
                table: "CultureTours",
                columns: new[] { "IsActive", "IsFeatured" });

            migrationBuilder.CreateIndex(
                name: "IX_CultureTours_Slug",
                table: "CultureTours",
                column: "Slug",
                unique: true,
                filter: "[DeletedAt] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DailyTours_CategoryId",
                table: "DailyTours",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyTours_IsActive_IsFeatured",
                table: "DailyTours",
                columns: new[] { "IsActive", "IsFeatured" });

            migrationBuilder.CreateIndex(
                name: "IX_DailyTours_Slug",
                table: "DailyTours",
                column: "Slug",
                unique: true,
                filter: "[DeletedAt] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CultureTours");

            migrationBuilder.DropTable(
                name: "DailyTours");
        }
    }
}
