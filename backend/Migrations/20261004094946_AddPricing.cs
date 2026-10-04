using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentravel.Migrations
{
    /// <inheritdoc />
    public partial class AddPricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AgePriceRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MinAge = table.Column<int>(type: "int", nullable: false),
                    MaxAge = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Percentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgePriceRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CultureTourAccommodationPrices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CultureTourId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccommodationTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PricePerPerson = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CultureTourAccommodationPrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CultureTourAccommodationPrices_AccommodationTypes_AccommodationTypeId",
                        column: x => x.AccommodationTypeId,
                        principalTable: "AccommodationTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CultureTourAccommodationPrices_CultureTours_CultureTourId",
                        column: x => x.CultureTourId,
                        principalTable: "CultureTours",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PriceRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TourSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TourType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TourId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Seats = table.Column<int>(type: "int", nullable: false),
                    PriceOverride = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TourSessions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AgePriceRules_OwnerType_OwnerId",
                table: "AgePriceRules",
                columns: new[] { "OwnerType", "OwnerId" });

            migrationBuilder.CreateIndex(
                name: "IX_CultureTourAccommodationPrices_AccommodationTypeId",
                table: "CultureTourAccommodationPrices",
                column: "AccommodationTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_CultureTourAccommodationPrices_CultureTourId_AccommodationTypeId",
                table: "CultureTourAccommodationPrices",
                columns: new[] { "CultureTourId", "AccommodationTypeId" },
                unique: true,
                filter: "[DeletedAt] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PriceRules_OwnerType_OwnerId",
                table: "PriceRules",
                columns: new[] { "OwnerType", "OwnerId" });

            migrationBuilder.CreateIndex(
                name: "IX_TourSessions_TourType_TourId_Date",
                table: "TourSessions",
                columns: new[] { "TourType", "TourId", "Date" },
                unique: true,
                filter: "[DeletedAt] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgePriceRules");

            migrationBuilder.DropTable(
                name: "CultureTourAccommodationPrices");

            migrationBuilder.DropTable(
                name: "PriceRules");

            migrationBuilder.DropTable(
                name: "TourSessions");
        }
    }
}
