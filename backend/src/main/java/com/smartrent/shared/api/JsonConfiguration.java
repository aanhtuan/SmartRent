package com.smartrent.shared.api;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.*;

@Configuration
public class JsonConfiguration {
  @Bean
  Jackson2ObjectMapperBuilderCustomizer strictJson() {
    return b ->
        b.featuresToEnable(
                JsonParser.Feature.STRICT_DUPLICATE_DETECTION,
                DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
            .featuresToDisable(
                com.fasterxml.jackson.databind.MapperFeature.ALLOW_COERCION_OF_SCALARS)
            .postConfigurer(
                mapper ->
                    mapper
                        .getFactory()
                        .setStreamReadConstraints(
                            com.fasterxml.jackson.core.StreamReadConstraints.builder()
                                .maxNestingDepth(50)
                                .maxNumberLength(100)
                                .maxStringLength(16384)
                                .maxDocumentLength(65536)
                                .build()));
  }
}
