CREATE TABLE IF NOT EXISTS users (
  id int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(32),
  email varchar(254) NOT NULL,
  `role` enum ('user', 'admin') DEFAULT 'user' NOT NULL,
  `status` enum ('active', 'banned', 'inactive') DEFAULT 'active' NOT NULL,
  providers json DEFAULT '{}' NOT NULL,
  gender enum ('male', 'female'),
  birthday DATE,
  karma int NOT NULL DEFAULT 0,
  color enum ('magenta', 'red', 'volcano', 'orange', 'lime', 'gold', 'green', 'cyan', 'blue', 'geekblue', 'purple', 'pink'),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT UK_Name UNIQUE (`name`),
  CONSTRAINT UK_Email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS tags (
  id int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(16) NOT NULL,
  user_id int NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT UK_Name UNIQUE (`name`),
  CONSTRAINT FK_Tags_Users FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS uploads (
  id int AUTO_INCREMENT PRIMARY KEY,
  `path` varchar(12) NOT NULL,
  `name` varchar(12) NOT NULL,
  `type` enum ('jpg', 'png', 'webp', 'gif') DEFAULT 'jpg' NOT NULL,
  user_id int NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT FK_Uploads_Users FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS posts (
  id int AUTO_INCREMENT PRIMARY KEY,
  title varchar(256) NOT NULL,
  body json DEFAULT '{}' NOT NULL,
  `status` enum ('published', 'draft', 'review') DEFAULT 'draft' NOT NULL,
  uri varchar(256) NOT NULL,
  likes int NOT NULL DEFAULT 0,
  user_id int NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  deleted_at DATETIME,
  CONSTRAINT FK_Posts_Users FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS post_uploads (
  id int AUTO_INCREMENT PRIMARY KEY,
  post_id int NOT NULL,
  upload_id int NOT NULL,
  CONSTRAINT FK_Post_uploads_Posts FOREIGN KEY (post_id) REFERENCES posts(id),
  CONSTRAINT FK_Post_uploads_Uploads FOREIGN KEY (upload_id) REFERENCES uploads(id)
);

CREATE TABLE IF NOT EXISTS post_tags (
  id int AUTO_INCREMENT PRIMARY KEY,
  post_id int NOT NULL,
  tag_id int NOT NULL,
  CONSTRAINT FK_Post_tags_Posts FOREIGN KEY (post_id) REFERENCES posts(id),
  CONSTRAINT FK_Post_tags_Tags FOREIGN KEY (tag_id) REFERENCES tags(id)
);