package com.smartrent;

import java.nio.file.*;
import java.security.*;
import java.util.Base64;
import org.springframework.test.context.DynamicPropertyRegistry;

/** Test-only RSA material, never an application default or Git artifact. */
public final class TestJwtKeys {
  private static final Path PRIVATE, PUBLIC, PREVIEW;

  static {
    try {
      var gen = KeyPairGenerator.getInstance("RSA");
      gen.initialize(2048);
      var pair = gen.generateKeyPair();
      PREVIEW = Files.createTempFile("smartrent-preview-test-", ".json");
      PREVIEW.toFile().deleteOnExit();
      byte[] preview = new byte[32];
      new SecureRandom().nextBytes(preview);
      Files.writeString(
          PREVIEW, "{\"v1\":\"" + Base64.getEncoder().encodeToString(preview) + "\"}");
      PRIVATE = Files.createTempFile("smartrent-test-", ".private.pem");
      PUBLIC = Files.createTempFile("smartrent-test-", ".public.pem");
      PRIVATE.toFile().deleteOnExit();
      PUBLIC.toFile().deleteOnExit();
      Files.writeString(PRIVATE, pem("PRIVATE KEY", pair.getPrivate().getEncoded()));
      Files.writeString(PUBLIC, pem("PUBLIC KEY", pair.getPublic().getEncoded()));
    } catch (Exception e) {
      throw new ExceptionInInitializerError(e);
    }
  }

  private static String pem(String label, byte[] bytes) {
    return "-----BEGIN "
        + label
        + "-----\n"
        + Base64.getMimeEncoder().encodeToString(bytes)
        + "\n-----END "
        + label
        + "-----\n";
  }

  public static String privateFile() {
    return PRIVATE.toString();
  }

  public static String publicFile() {
    return PUBLIC.toString();
  }

  public static void configure(DynamicPropertyRegistry r) {
    r.add("SMARTRENT_PREVIEW_KEYS_FILE", PREVIEW::toString);
    r.add("SMARTRENT_JWT_PRIVATE_KEY_FILE", PRIVATE::toString);
    r.add("SMARTRENT_JWT_PUBLIC_KEY_FILE", PUBLIC::toString);
  }
}
