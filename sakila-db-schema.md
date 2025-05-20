This describes the tables, indexes and relations of the sakila database. The following are three groups of data in CSV format:

1. here are all the table names, columns, types, and more table info in CSV format:

table_name,column_name,data_type,character_maximum_length,column_default,is_nullable,column_description
actor,actor_id,integer,null,nextval('actor_actor_id_seq'::regclass),NO,null
actor,first_name,text,null,null,NO,null
actor,last_name,text,null,null,NO,null
actor,last_update,timestamp with time zone,null,now(),NO,null
actor_info,actor_id,integer,null,null,YES,null
actor_info,first_name,text,null,null,YES,null
actor_info,last_name,text,null,null,YES,null
actor_info,film_info,text,null,null,YES,null
address,address_id,integer,null,nextval('address_address_id_seq'::regclass),NO,null
address,address,text,null,null,NO,null
address,address2,text,null,null,YES,null
address,district,text,null,null,NO,null
address,city_id,integer,null,null,NO,null
address,postal_code,text,null,null,YES,null
address,phone,text,null,null,NO,null
address,last_update,timestamp with time zone,null,now(),NO,null
category,category_id,integer,null,nextval('category_category_id_seq'::regclass),NO,null
category,name,text,null,null,NO,null
category,last_update,timestamp with time zone,null,now(),NO,null
city,city_id,integer,null,nextval('city_city_id_seq'::regclass),NO,null
city,city,text,null,null,NO,null
city,country_id,integer,null,null,NO,null
city,last_update,timestamp with time zone,null,now(),NO,null
country,country_id,integer,null,nextval('country_country_id_seq'::regclass),NO,null
country,country,text,null,null,NO,null
country,last_update,timestamp with time zone,null,now(),NO,null
customer,customer_id,integer,null,nextval('customer_customer_id_seq'::regclass),NO,null
customer,store_id,integer,null,null,NO,null
customer,first_name,text,null,null,NO,null
customer,last_name,text,null,null,NO,null
customer,email,text,null,null,YES,null
customer,address_id,integer,null,null,NO,null
customer,activebool,boolean,null,true,NO,null
customer,create_date,date,null,CURRENT_DATE,NO,null
customer,last_update,timestamp with time zone,null,now(),YES,null
customer,active,integer,null,null,YES,null
customer_list,id,integer,null,null,YES,null
customer_list,name,text,null,null,YES,null
customer_list,address,text,null,null,YES,null
customer_list,zip code,text,null,null,YES,null
customer_list,phone,text,null,null,YES,null
customer_list,city,text,null,null,YES,null
customer_list,country,text,null,null,YES,null
customer_list,notes,text,null,null,YES,null
customer_list,sid,integer,null,null,YES,null
film,film_id,integer,null,nextval('film_film_id_seq'::regclass),NO,null
film,title,text,null,null,NO,null
film,description,text,null,null,YES,null
film,release_year,integer,null,null,YES,null
film,language_id,integer,null,null,NO,null
film,original_language_id,integer,null,null,YES,null
film,rental_duration,smallint,null,3,NO,null
film,rental_rate,numeric,null,4.99,NO,null
film,length,smallint,null,null,YES,null
film,replacement_cost,numeric,null,19.99,NO,null
film,rating,USER-DEFINED,null,'G'::mpaa_rating,YES,null
film,last_update,timestamp with time zone,null,now(),NO,null
film,special_features,ARRAY,null,null,YES,null
film,fulltext,tsvector,null,null,NO,null
film_actor,actor_id,integer,null,null,NO,null
film_actor,film_id,integer,null,null,NO,null
film_actor,last_update,timestamp with time zone,null,now(),NO,null
film_category,film_id,integer,null,null,NO,null
film_category,category_id,integer,null,null,NO,null
film_category,last_update,timestamp with time zone,null,now(),NO,null
film_list,fid,integer,null,null,YES,null
film_list,title,text,null,null,YES,null
film_list,description,text,null,null,YES,null
film_list,category,text,null,null,YES,null
film_list,price,numeric,null,null,YES,null
film_list,length,smallint,null,null,YES,null
film_list,rating,USER-DEFINED,null,null,YES,null
film_list,actors,text,null,null,YES,null
inventory,inventory_id,integer,null,nextval('inventory_inventory_id_seq'::regclass),NO,null
inventory,film_id,integer,null,null,NO,null
inventory,store_id,integer,null,null,NO,null
inventory,last_update,timestamp with time zone,null,now(),NO,null
language,language_id,integer,null,nextval('language_language_id_seq'::regclass),NO,null
language,name,character,20,null,NO,null
language,last_update,timestamp with time zone,null,now(),NO,null
nicer_but_slower_film_list,fid,integer,null,null,YES,null
nicer_but_slower_film_list,title,text,null,null,YES,null
nicer_but_slower_film_list,description,text,null,null,YES,null
nicer_but_slower_film_list,category,text,null,null,YES,null
nicer_but_slower_film_list,price,numeric,null,null,YES,null
nicer_but_slower_film_list,length,smallint,null,null,YES,null
nicer_but_slower_film_list,rating,USER-DEFINED,null,null,YES,null
nicer_but_slower_film_list,actors,text,null,null,YES,null
payment,payment_id,integer,null,nextval('payment_payment_id_seq'::regclass),NO,null
payment,customer_id,integer,null,null,NO,null
payment,staff_id,integer,null,null,NO,null
payment,rental_id,integer,null,null,NO,null
payment,amount,numeric,null,null,NO,null
payment,payment_date,timestamp with time zone,null,null,NO,null
payment_p2022_01,payment_id,integer,null,nextval('payment_payment_id_seq'::regclass),NO,null
payment_p2022_01,customer_id,integer,null,null,NO,null
payment_p2022_01,staff_id,integer,null,null,NO,null
payment_p2022_01,rental_id,integer,null,null,NO,null
payment_p2022_01,amount,numeric,null,null,NO,null
payment_p2022_01,payment_date,timestamp with time zone,null,null,NO,null
payment_p2022_02,payment_id,integer,null,nextval('payment_payment_id_seq'::regclass),NO,null
payment_p2022_02,customer_id,integer,null,null,NO,null
payment_p2022_02,staff_id,integer,null,null,NO,null
payment_p2022_02,rental_id,integer,null,null,NO,null
payment_p2022_02,amount,numeric,null,null,NO,null
payment_p2022_02,payment_date,timestamp with time zone,null,null,NO,null
payment_p2022_03,payment_id,integer,null,nextval('payment_payment_id_seq'::regclass),NO,null
payment_p2022_03,customer_id,integer,null,null,NO,null
payment_p2022_03,staff_id,integer,null,null,NO,null
payment_p2022_03,rental_id,integer,null,null,NO,null
payment_p2022_03,amount,numeric,null,null,NO,null
payment_p2022_03,payment_date,timestamp with time zone,null,null,NO,null
payment_p2022_04,payment_id,integer,null,nextval('payment_payment_id_seq'::regclass),NO,null
payment_p2022_04,customer_id,integer,null,null,NO,null
payment_p2022_04,staff_id,integer,null,null,NO,null
payment_p2022_04,rental_id,integer,null,null,NO,null
payment_p2022_04,amount,numeric,null,null,NO,null
payment_p2022_04,payment_date,timestamp with time zone,null,null,NO,null
payment_p2022_05,payment_id,integer,null,nextval('payment_payment_id_seq'::regclass),NO,null
payment_p2022_05,customer_id,integer,null,null,NO,null
payment_p2022_05,staff_id,integer,null,null,NO,null
payment_p2022_05,rental_id,integer,null,null,NO,null
payment_p2022_05,amount,numeric,null,null,NO,null
payment_p2022_05,payment_date,timestamp with time zone,null,null,NO,null
payment_p2022_06,payment_id,integer,null,nextval('payment_payment_id_seq'::regclass),NO,null
payment_p2022_06,customer_id,integer,null,null,NO,null
payment_p2022_06,staff_id,integer,null,null,NO,null
payment_p2022_06,rental_id,integer,null,null,NO,null
payment_p2022_06,amount,numeric,null,null,NO,null
payment_p2022_06,payment_date,timestamp with time zone,null,null,NO,null
payment_p2022_07,payment_id,integer,null,nextval('payment_payment_id_seq'::regclass),NO,null
payment_p2022_07,customer_id,integer,null,null,NO,null
payment_p2022_07,staff_id,integer,null,null,NO,null
payment_p2022_07,rental_id,integer,null,null,NO,null
payment_p2022_07,amount,numeric,null,null,NO,null
payment_p2022_07,payment_date,timestamp with time zone,null,null,NO,null
rental,rental_id,integer,null,nextval('rental_rental_id_seq'::regclass),NO,null
rental,rental_date,timestamp with time zone,null,null,NO,null
rental,inventory_id,integer,null,null,NO,null
rental,customer_id,integer,null,null,NO,null
rental,return_date,timestamp with time zone,null,null,YES,null
rental,staff_id,integer,null,null,NO,null
rental,last_update,timestamp with time zone,null,now(),NO,null
sales_by_film_category,category,text,null,null,YES,null
sales_by_film_category,total_sales,numeric,null,null,YES,null
sales_by_store,store,text,null,null,YES,null
sales_by_store,manager,text,null,null,YES,null
sales_by_store,total_sales,numeric,null,null,YES,null
staff,staff_id,integer,null,nextval('staff_staff_id_seq'::regclass),NO,null
staff,first_name,text,null,null,NO,null
staff,last_name,text,null,null,NO,null
staff,address_id,integer,null,null,NO,null
staff,email,text,null,null,YES,null
staff,store_id,integer,null,null,NO,null
staff,active,boolean,null,true,NO,null
staff,username,text,null,null,NO,null
staff,password,text,null,null,YES,null
staff,last_update,timestamp with time zone,null,now(),NO,null
staff,picture,bytea,null,null,YES,null
staff_list,id,integer,null,null,YES,null
staff_list,name,text,null,null,YES,null
staff_list,address,text,null,null,YES,null
staff_list,zip code,text,null,null,YES,null
staff_list,phone,text,null,null,YES,null
staff_list,city,text,null,null,YES,null
staff_list,country,text,null,null,YES,null
staff_list,sid,integer,null,null,YES,null
store,store_id,integer,null,nextval('store_store_id_seq'::regclass),NO,null
store,manager_staff_id,integer,null,null,NO,null
store,address_id,integer,null,null,NO,null
store,last_update,timestamp with time zone,null,now(),NO,null

2. here are all the db indexes in CSV format:

table_name,index_name,column_name
actor,actor_pkey,actor_id
actor,idx_actor_last_name,last_name
address,address_pkey,address_id
address,idx_fk_city_id,city_id
category,category_pkey,category_id
city,city_pkey,city_id
city,idx_fk_country_id,country_id
country,country_pkey,country_id
customer,customer_pkey,customer_id
customer,idx_fk_address_id,address_id
customer,idx_fk_store_id,store_id
customer,idx_last_name,last_name
film,film_fulltext_idx,fulltext
film,film_pkey,film_id
film,idx_fk_language_id,language_id
film,idx_fk_original_language_id,original_language_id
film,idx_title,title
film_actor,film_actor_pkey,film_id
film_actor,film_actor_pkey,actor_id
film_actor,idx_fk_film_id,film_id
film_category,film_category_pkey,category_id
film_category,film_category_pkey,film_id
inventory,idx_store_id_film_id,store_id
inventory,idx_store_id_film_id,film_id
inventory,inventory_pkey,inventory_id
language,language_pkey,language_id
payment_p2022_01,idx_fk_payment_p2022_01_customer_id,customer_id
payment_p2022_01,idx_fk_payment_p2022_01_staff_id,staff_id
payment_p2022_01,payment_p2022_01_customer_id_idx,customer_id
payment_p2022_01,payment_p2022_01_pkey,payment_id
payment_p2022_01,payment_p2022_01_pkey,payment_date
payment_p2022_02,idx_fk_payment_p2022_02_customer_id,customer_id
payment_p2022_02,idx_fk_payment_p2022_02_staff_id,staff_id
payment_p2022_02,payment_p2022_02_customer_id_idx,customer_id
payment_p2022_02,payment_p2022_02_pkey,payment_date
payment_p2022_02,payment_p2022_02_pkey,payment_id
payment_p2022_03,idx_fk_payment_p2022_03_customer_id,customer_id
payment_p2022_03,idx_fk_payment_p2022_03_staff_id,staff_id
payment_p2022_03,payment_p2022_03_customer_id_idx,customer_id
payment_p2022_03,payment_p2022_03_pkey,payment_id
payment_p2022_03,payment_p2022_03_pkey,payment_date
payment_p2022_04,idx_fk_payment_p2022_04_customer_id,customer_id
payment_p2022_04,idx_fk_payment_p2022_04_staff_id,staff_id
payment_p2022_04,payment_p2022_04_customer_id_idx,customer_id
payment_p2022_04,payment_p2022_04_pkey,payment_id
payment_p2022_04,payment_p2022_04_pkey,payment_date
payment_p2022_05,idx_fk_payment_p2022_05_customer_id,customer_id
payment_p2022_05,idx_fk_payment_p2022_05_staff_id,staff_id
payment_p2022_05,payment_p2022_05_customer_id_idx,customer_id
payment_p2022_05,payment_p2022_05_pkey,payment_id
payment_p2022_05,payment_p2022_05_pkey,payment_date
payment_p2022_06,idx_fk_payment_p2022_06_customer_id,customer_id
payment_p2022_06,idx_fk_payment_p2022_06_staff_id,staff_id
payment_p2022_06,payment_p2022_06_customer_id_idx,customer_id
payment_p2022_06,payment_p2022_06_pkey,payment_date
payment_p2022_06,payment_p2022_06_pkey,payment_id
payment_p2022_07,payment_p2022_07_pkey,payment_date
payment_p2022_07,payment_p2022_07_pkey,payment_id
rental,idx_fk_inventory_id,inventory_id
rental,idx_unq_rental_rental_date_inventory_id_customer_id,customer_id
rental,idx_unq_rental_rental_date_inventory_id_customer_id,inventory_id
rental,idx_unq_rental_rental_date_inventory_id_customer_id,rental_date
rental,rental_pkey,rental_id
staff,staff_pkey,staff_id
store,idx_unq_manager_staff_id,manager_staff_id
store,store_pkey,store_id

3. here are the DB's foreign key relations in CSV format:

table_name,column_name,foreign_table_name,foreign_column_name
address,city_id,city,city_id
city,country_id,country,country_id
customer,address_id,address,address_id
customer,store_id,store,store_id
film,original_language_id,language,language_id
film,language_id,language,language_id
film_actor,film_id,film,film_id
film_actor,actor_id,actor,actor_id
film_category,category_id,category,category_id
film_category,film_id,film,film_id
inventory,film_id,film,film_id
inventory,store_id,store,store_id
payment_p2022_01,customer_id,customer,customer_id
payment_p2022_01,rental_id,rental,rental_id
payment_p2022_01,staff_id,staff,staff_id
payment_p2022_02,customer_id,customer,customer_id
payment_p2022_02,rental_id,rental,rental_id
payment_p2022_02,staff_id,staff,staff_id
payment_p2022_03,customer_id,customer,customer_id
payment_p2022_03,rental_id,rental,rental_id
payment_p2022_03,staff_id,staff,staff_id
payment_p2022_04,customer_id,customer,customer_id
payment_p2022_04,rental_id,rental,rental_id
payment_p2022_04,staff_id,staff,staff_id
payment_p2022_05,customer_id,customer,customer_id
payment_p2022_05,rental_id,rental,rental_id
payment_p2022_05,staff_id,staff,staff_id
payment_p2022_06,customer_id,customer,customer_id
payment_p2022_06,rental_id,rental,rental_id
payment_p2022_06,staff_id,staff,staff_id
rental,customer_id,customer,customer_id
rental,inventory_id,inventory,inventory_id
rental,staff_id,staff,staff_id
staff,address_id,address,address_id
staff,store_id,store,store_id
store,address_id,address,address_id
