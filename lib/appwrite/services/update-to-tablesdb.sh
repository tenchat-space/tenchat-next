#!/bin/bash
# Update all service files to use proper TablesDB API format

for file in social.service.ts web3.service.ts; do
  # Replace createRow calls
  perl -i -pe 's/tablesDB\.createRow<(\w+)>\(\s*this\.databaseId,\s*(\w+),\s*ID\.unique\(\),\s*({[^}]+})\s*\)/tablesDB.createRow({ databaseId: this.databaseId, tableId: $2, rowId: ID.unique(), data: $3 }) as $1/gs' "$file"
  
  # Replace getRow calls  
  perl -i -pe 's/tablesDB\.getRow<(\w+)>\(\s*this\.databaseId,\s*(\w+),\s*(\w+)\s*\)/tablesDB.getRow({ databaseId: this.databaseId, tableId: $2, rowId: $3 }) as $1/gs' "$file"
  
  # Replace listRows calls
  perl -i -pe 's/tablesDB\.listRows<(\w+)>\(\s*this\.databaseId,\s*(\w+),\s*(\[[^\]]+\])\s*\)/tablesDB.listRows({ databaseId: this.databaseId, tableId: $2, queries: $3 })/gs' "$file"
  
  # Replace updateRow calls
  perl -i -pe 's/tablesDB\.updateRow<(\w+)>\(\s*this\.databaseId,\s*(\w+),\s*(\w+),\s*({[^}]+})\s*\)/tablesDB.updateRow({ databaseId: this.databaseId, tableId: $2, rowId: $3, data: $4 }) as $1/gs' "$file"
  
  # Replace deleteRow calls
  perl -i -pe 's/tablesDB\.deleteRow\(\s*this\.databaseId,\s*(\w+),\s*(\w+)\s*\)/tablesDB.deleteRow({ databaseId: this.databaseId, tableId: $1, rowId: $2 })/gs' "$file"
done

echo "✅ Updated service files to use proper TablesDB API format"
