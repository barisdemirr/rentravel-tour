using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentravel.Migrations
{
    /// <inheritdoc />
    public partial class AddBungalowCapacityAndExtraAdultFee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ExtraAdultPricePerNight",
                table: "Bungalows",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "MaxCapacity",
                table: "Bungalows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StandardCapacity",
                table: "Bungalows",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExtraAdultPricePerNight",
                table: "Bungalows");

            migrationBuilder.DropColumn(
                name: "MaxCapacity",
                table: "Bungalows");

            migrationBuilder.DropColumn(
                name: "StandardCapacity",
                table: "Bungalows");
        }
    }
}
