package com.rasie.purrfectthreads;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.text.ParsePosition;
import java.util.Locale;
import java.util.TimeZone;
final class BillingWire {
    static byte[] read(InputStream input, int limit) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024]; int count;
        while ((count = input.read(buffer)) != -1) {
            if (output.size() + count > limit) throw new IOException("Response too large");
            output.write(buffer, 0, count);
        }
        return output.toByteArray();
    }
    static long timestamp(String value) {
        if (!value.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z")) throw new IllegalArgumentException();
        SimpleDateFormat parser = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.ROOT);
        parser.setTimeZone(TimeZone.getTimeZone("UTC")); parser.setLenient(false);
        ParsePosition position = new ParsePosition(0); var result = parser.parse(value, position);
        if (result == null || position.getIndex() != value.length()) throw new IllegalArgumentException();
        return result.getTime();
    }
    static boolean authoritative(int status, String code) {
        return status == 401 || status == 403 || "PURCHASE_REVOKED".equals(code);
    }
}
