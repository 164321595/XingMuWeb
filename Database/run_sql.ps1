param([string]$sqlFile, [string]$mysqlHost="localhost", [string]$mysqlUser="root", [string]$mysqlPass="123456", [string]$database="ticketdb")
$env:MYSQL_PWD=$mysqlPass
$commands = @"
USE $database;
SOURCE $sqlFile;
"@
$commands | mysql -h $mysqlHost -u $mysqlUser
