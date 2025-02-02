import initializeSupabase from "../config/supabaseConnect.js";

export const uploadQRCodeToSupabase = async (qrCodeDataUrl, userId) => {
  // Initialize Supabase client
  const supabase = initializeSupabase();
  if (!supabase) {
    throw new Error("Failed to initialize Supabase client");
  }

  // Convert base64 to buffer
  const base64Data = qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Generate unique filename
  const filename = `qr_${userId}_${Date.now()}.png`;

  // Upload to Supabase
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('temporary_QR')
    .upload(filename, buffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Failed to upload QR code: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('temporary_QR')
    .getPublicUrl(filename);

  // Schedule cleanup
  scheduleQRCodeCleanup(filename);

  return { publicUrl, filename };
};

export const scheduleQRCodeCleanup = (filename) => {
  setTimeout(async () => {
    const supabase = initializeSupabase();
    if (!supabase) {
      console.error('Failed to initialize Supabase client for cleanup');
      return;
    }

    const { error: deleteError } = await supabase.storage
      .from('temporary_QR')
      .remove([filename]);
    
    if (deleteError) {
      console.error('Error deleting QR code:', deleteError);
    }
    console.log('QR code deleted:', filename);
  }, 5 * 60 * 1000); //5 minutes
};

export const deleteQRCode = async (filename) => {
  const supabase = initializeSupabase();
  if (!supabase) {
    throw new Error("Failed to initialize Supabase client");
  }

  const { error: deleteError } = await supabase.storage
    .from('temporary_QR')
    .remove([filename]);
  
  if (deleteError) {
    throw new Error(`Failed to delete QR code: ${deleteError.message}`);
  }
}; 