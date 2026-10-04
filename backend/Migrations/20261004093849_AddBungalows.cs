using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentravel.Migrations
{
    /// <inheritdoc />
    public partial class AddBungalows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bungalows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RegionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LongDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Gallery = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BreakfastIncluded = table.Column<bool>(type: "bit", nullable: false),
                    BreakfastNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BreakfastCard = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Capacity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Amenities = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FeatureStrip = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DetailedAmenities = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Distances = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LocationNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rules = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RatingLabel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RatingScore = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: true),
                    RatingCount = table.Column<int>(type: "int", nullable: true),
                    SeoTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeoDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeoKeywords = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OgImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultPricePerNight = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bungalows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bungalows_BungalowRegions_RegionId",
                        column: x => x.RegionId,
                        principalTable: "BungalowRegions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bungalows_IsActive_IsFeatured",
                table: "Bungalows",
                columns: new[] { "IsActive", "IsFeatured" });

            migrationBuilder.CreateIndex(
                name: "IX_Bungalows_RegionId",
                table: "Bungalows",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_Bungalows_Slug",
                table: "Bungalows",
                column: "Slug",
                unique: true,
                filter: "[DeletedAt] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bungalows");
        }
    }
}
