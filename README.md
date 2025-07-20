# Astrovibe server

The backend for a Astrovibe

### eslint & prettier

```
yarn add -D eslint eslint-plugin-node eslint-config-prettier eslint-plugin-prettier nodemon prettier
```

### upgrade

```
sudo apt update && sudo apt upgrade -y
```

### ufw

```
sudo apt-get install ufw
sudo ufw status verbose
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw enable
```

### nginx

```
sudo apt update
sudo apt install nginx
sudo ufw app list
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'


nano /etc/nginx/conf.d/nginx.conf
nginx -t
sudo systemctl restart nginx

// for static
cd /var/www
mkdir -p uploads
sudo chown -R $USER:$USER uploads
sudo chmod -R 755 uploads
```

### node

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install --lts
npm install --global yarn
npm install pm2@latest -g
```

### certbot

```
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```

### mariadb

```
sudo apt install mariadb-server
sudo mysql_secure_installation
sudo mysql -u root
CREATE USER 'hello'@'localhost' IDENTIFIED BY 'world';
GRANT ALL PRIVILEGES ON *.* TO 'hello'@'localhost' WITH GRANT OPTION;
```

![alt text](schema.png 'Schema')

### count strings

```
wc $(find . -type f | egrep "\.(js|sql|sh|scss|html|json)" )
```

Mail.ru
lilyfamily@mail.ru
B@dbanana12

https://easy-lose-weight.info/tablitsa-kaloriinosti-productov-pitaniya/
https://www.convertjson.com/html-table-to-json.htm

```
server {
    listen 80;
    server_name astrovibe.ru;

    location / {
        root /var/www/html;
        index index.html;
        error_page 404 index.html;
    }
}
```

const sanitizeConf = {
allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'h3'],
allowedAttributes: { a: ['href'] }
}
