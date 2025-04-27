
-- Create a function to update token balance
CREATE OR REPLACE FUNCTION public.update_token_balance(
  p_user_id UUID,
  p_amount INT,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT ''
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user's token balance
  UPDATE profiles 
  SET token_balance = token_balance + p_amount
  WHERE id = p_user_id;
  
  -- Record the transaction
  INSERT INTO token_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    p_user_id, 
    p_amount, 
    p_transaction_type, 
    p_description
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
