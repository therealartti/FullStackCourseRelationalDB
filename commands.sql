fly postgres connect -a quiet-sky-6044

CREATE TABLE blogs (
    id SERIAL PRIMARY KEY, 
    author text, 
    url text NOT NULL, 
    title text NOT NULL, 
    likes integer DEFAULT 0);

insert into blogs (author, url, title, likes) values('test Author', 'www.test.com', 'Testing', 2001);
insert into blogs (url, title) values('www.test2.com', 'Testing2');

