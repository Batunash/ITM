using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixSeedPasswordHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$SyvrsxlVhcz.qezKwEc3W.4ijQS.ddfLBLjmcnDDP9yvVadk1vY8G");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$SyvrsxlVhcz.qezKwEc3W.4ijQS.ddfLBLjmcnDDP9yvVadk1vY8G");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$SyvrsxlVhcz.qezKwEc3W.4ijQS.ddfLBLjmcnDDP9yvVadk1vY8G");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$SyvrsxlVhcz.qezKwEc3W.4ijQS.ddfLBLjmcnDDP9yvVadk1vY8G");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$rBNmGz3hn7kHpVXJK6dYAO1a9KZTM2yPjKIPxFbQZpLTHGt3qGNwO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$rBNmGz3hn7kHpVXJK6dYAO1a9KZTM2yPjKIPxFbQZpLTHGt3qGNwO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$rBNmGz3hn7kHpVXJK6dYAO1a9KZTM2yPjKIPxFbQZpLTHGt3qGNwO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "PasswordHash",
                value: "$2a$11$rBNmGz3hn7kHpVXJK6dYAO1a9KZTM2yPjKIPxFbQZpLTHGt3qGNwO");
        }
    }
}
