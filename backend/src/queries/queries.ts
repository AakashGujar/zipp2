export const queries = {
  EXISTING_USER: `SELECT * FROM users WHERE email = $1`,
  INSERT_USER: `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
  GET_USER_BY_EMAIL: `SELECT * FROM users WHERE email = $1`,
  CREATE_URL: `INSERT INTO urls (original_url, short_url, user_id, qr_code) VALUES ($1, $2, $3, $4) RETURNING *`,
  GET_URLS_BY_USER: `SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC`,
  SEARCH_QUERY: `SELECT * FROM urls 
    WHERE user_id = $1 
    AND (original_url ILIKE $2 OR short_url ILIKE $2 OR title ILIKE $2)`,
  DELETE_URL: "DELETE FROM urls WHERE id = $1 AND user_id = $2 RETURNING *",
  GET_URL_BY_SHORT: `SELECT * FROM urls WHERE short_url = $1`,
  RECORD_CLICK: `INSERT INTO clicks (url_id, city, device, country)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
  GET_URL_ANALYTICS: `
        SELECT 
          u.*,
          COUNT(c.id) as total_clicks,
          json_agg(json_build_object(
            'id', c.id,
            'city', c.city,
            'device', c.device,
            'country', c.country,
            'created_at', c.created_at
          )) as click_details
        FROM urls u
        LEFT JOIN clicks c ON u.id = c.url_id
        WHERE u.id = $1
        GROUP BY u.id
      `,
};
