
-- Generate mock conciliação data for testing
WITH congregation_ids AS (
  SELECT id, name FROM congregations WHERE is_active = true
),
months_data AS (
  SELECT 
    date_trunc('month', CURRENT_DATE - INTERVAL '1 month' * generate_series(0, 5))::date as month_date
),
mock_data AS (
  SELECT 
    c.id as congregation_id,
    m.month_date,
    -- Generate 3 records per congregation per month
    generate_series(1, 3) as record_num,
    -- Random total income between 2000 and 12000
    2000 + (random() * 10000)::numeric(10,2) as total_income
  FROM congregation_ids c
  CROSS JOIN months_data m
)
INSERT INTO reconciliations (
  congregation_id,
  month,
  total_income,
  amount_to_send,
  pix,
  online_pix,
  debit,
  credit,
  cash,
  status,
  sent_date,
  approved_at,
  approved_by,
  created_at
)
SELECT 
  md.congregation_id,
  md.month_date,
  md.total_income,
  (md.total_income * 0.15)::numeric(10,2) as amount_to_send,
  -- Distribute total income across payment methods
  (md.total_income * (0.3 + random() * 0.2))::numeric(10,2) as pix,
  (md.total_income * (0.1 + random() * 0.15))::numeric(10,2) as online_pix,
  (md.total_income * (0.05 + random() * 0.1))::numeric(10,2) as debit,
  (md.total_income * (0.1 + random() * 0.15))::numeric(10,2) as credit,
  (md.total_income * (0.2 + random() * 0.2))::numeric(10,2) as cash,
  'approved' as status,
  -- Sent date between 1-5 days after month end
  (md.month_date + INTERVAL '1 month' + INTERVAL '1 day' * (1 + random() * 4)::int)::date as sent_date,
  -- Approved date 1-3 days after sent date
  (md.month_date + INTERVAL '1 month' + INTERVAL '1 day' * (2 + random() * 3)::int + INTERVAL '2 hours')::timestamp as approved_at,
  -- Use first user ID from profiles table as approver
  (SELECT id FROM profiles WHERE role IN ('admin', 'superadmin') LIMIT 1) as approved_by,
  -- Created date same as month + some random days
  (md.month_date + INTERVAL '1 day' * (random() * 28)::int + INTERVAL '1 hour' * (random() * 23)::int)::timestamp as created_at
FROM mock_data md;
