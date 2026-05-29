package pe.edu.emch.sgi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        // Sin ObjectMapper personalizado: GenericJackson2JsonRedisSerializer()
        // configura su propio ObjectMapper internamente, ya ajustado para la
        // versión de Jackson instalada (2.21.x en Spring Boot 3.5.x).
        // Pasar un ObjectMapper con activateDefaultTyping(NON_FINAL, PROPERTY)
        // provoca MismatchedInputException en Jackson 2.21 porque el formato de
        // tipo que escribe el serializer difiere del que espera el deserializador
        // de Spring Data Redis 3.5.x (AsArrayTypeDeserializer vs AsPropertyTypeDeserializer).
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer();

        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(serializer))
            .disableCachingNullValues();

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .build();
    }
}
