import sqlite3
import json

def migrate_image_urls():
    # 连接数据库
    conn = sqlite3.connect('posts.db')
    cursor = conn.cursor()
    
    try:
        # 检查是否已经有 image_urls 列
        cursor.execute("PRAGMA table_info(posts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'image_urls' not in columns:
            # 添加新的 image_urls 列
            cursor.execute("ALTER TABLE posts ADD COLUMN image_urls TEXT")
            print("添加了 image_urls 列")
        
        # 将现有的 image_url 数据迁移到 image_urls
        cursor.execute("SELECT id, image_url FROM posts WHERE image_url IS NOT NULL AND image_url != ''")
        posts_with_images = cursor.fetchall()
        
        for post_id, image_url in posts_with_images:
            # 将单个 URL 转换为数组
            image_urls_json = json.dumps([image_url])
            cursor.execute("UPDATE posts SET image_urls = ? WHERE id = ?", (image_urls_json, post_id))
            print(f"迁移帖子 {post_id} 的图片")
        
        # 对于没有图片的帖子，设置空数组
        cursor.execute("UPDATE posts SET image_urls = '[]' WHERE image_urls IS NULL")
        
        conn.commit()
        print("数据迁移完成!")
        
        # 可选：删除旧的 image_url 列（SQLite不支持DROP COLUMN，所以创建新表）
        create_new_table_sql = """
        CREATE TABLE posts_new (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            image_urls TEXT,
            author_id TEXT NOT NULL,
            is_hidden INTEGER DEFAULT 0 NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users (id)
        )
        """
        
        cursor.execute(create_new_table_sql)
        cursor.execute("""
            INSERT INTO posts_new (id, title, content, image_urls, author_id, is_hidden, created_at, updated_at)
            SELECT id, title, content, image_urls, author_id, is_hidden, created_at, updated_at
            FROM posts
        """)
        
        cursor.execute("DROP TABLE posts")
        cursor.execute("ALTER TABLE posts_new RENAME TO posts")
        
        conn.commit()
        print("删除旧的 image_url 列完成!")
        
    except Exception as e:
        print(f"迁移出错: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_image_urls()