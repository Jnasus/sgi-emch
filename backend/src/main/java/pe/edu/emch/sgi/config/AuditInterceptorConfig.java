package pe.edu.emch.sgi.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import pe.edu.emch.sgi.security.AuditSessionInterceptor;

@Configuration
@RequiredArgsConstructor
public class AuditInterceptorConfig implements WebMvcConfigurer {

    private final AuditSessionInterceptor auditSessionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(auditSessionInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/auth/**");
    }
}
