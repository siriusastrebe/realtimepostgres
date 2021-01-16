const pg = require('pg');


const postgres = new pg.Client({                            
  user: 'sirius',                                         
  host: 'localhost',                                      
  database: 'realtimepostgres',
  password: '',
  port: 5432,
});  
postgres.connect();                                       

let lastCreated;

postgres.on('notification', msg => {
  console.log(msg.channel);
  console.log(msg.payload);
  lastCreated = JSON.parse(msg.payload);
});

postgres.query('LISTEN changes')


try {
  postgres.query({text: "INSERT INTO accounts (username) VALUES ('Jackson');"});
} catch (e) {
  console.error(e);
}

setInterval(() => {
  // postgres.query("NOTIFY insertion, 'bar!'");
  try {
    postgres.query({text: "INSERT INTO accounts (username) VALUES ('Jackson');"});
  } catch (e) {
    console.error(e);
  }
}, 6000);

setInterval(() => {
  postgres.query({text: "DELETE FROM accounts WHERE ID = $1;", values: [lastCreated.id]});
}, 10000)

/*
create table accounts (
  username varchar(64),
  id serial
)



// Best general purpose solution
CREATE OR REPLACE FUNCTION changes() RETURNS trigger AS $$
DECLARE
  row record;
BEGIN
  IF (NEW IS NOT NULL) THEN 
    row := NEW;
  ELSE 
    row := OLD;
  END IF;

  PERFORM (
    select pg_notify('changes', '{"id": "' || row.id::text || '", "operation": "' || TG_OP || '", "table": "' || TG_TABLE_NAME || '"}')
  );
  RETURN null;
END;
$$ LANGUAGE plpgsql;

create trigger accounts_triggers AFTER INSERT OR UPDATE OR DELETE ON accounts FOR EACH ROW EXECUTE PROCEDURE changes();






// Drop a function
Drop function accounts_insert;
// Drop a trigger
drop trigger accounts_insert_trigger on accounts;

// Notifying an entire row as JSON (Not scalable since payload sizes cap out at 8kb)
// CREATE OR REPLACE FUNCTION accounts_insert() RETURNS trigger AS $$
// DECLARE
// BEGIN
//   PERFORM (
//     select pg_notify('insertion'::text, row_to_json(NEW)::text)
//   );
//   RETURN new;
// END;
// $$ LANGUAGE plpgsql;

create trigger accounts_insert_trigger AFTER INSERT ON accounts FOR EACH ROW EXECUTE PROCEDURE accounts_insert();



// list userdefined functions
// https://dataedo.com/kb/query/postgresql/list-user-defined-functions

select n.nspname as schema_name,
       p.proname as specific_name,
       case p.prokind 
            when 'f' then 'FUNCTION'
            when 'p' then 'PROCEDURE'
            when 'a' then 'AGGREGATE'
            when 'w' then 'WINDOW'
            end as kind,
       l.lanname as language,
       case when l.lanname = 'internal' then p.prosrc
            else pg_get_functiondef(p.oid)
            end as definition,
       pg_get_function_arguments(p.oid) as arguments,
       t.typname as return_type
from pg_proc p
left join pg_namespace n on p.pronamespace = n.oid
left join pg_language l on p.prolang = l.oid
left join pg_type t on t.oid = p.prorettype 
where n.nspname not in ('pg_catalog', 'information_schema')
order by schema_name,
         specific_name;


// List user defined triggers
select * from information_schema.triggers

// List user defined triggers verbose
select event_object_schema as table_schema,
       event_object_table as table_name,
       trigger_schema,
       trigger_name,
       string_agg(event_manipulation, ',') as event,
       action_timing as activation,
       action_condition as condition,
       action_statement as definition
from information_schema.triggers
group by 1,2,3,4,6,7,8
order by table_schema,
         table_name;


General notes:
connection pools can't be used to monitor LISTEN/NOTIFY streams
Triggers can't be used for each row on TRUNCATE, otherwise you will see the error ERROR:  TRUNCATE FOR EACH ROW triggers are not supported


*/
