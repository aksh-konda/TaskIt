package com.iamak.taskit;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest(properties = {
		"spring.autoconfigure.exclude=org.springframework.ai.model.google.genai.autoconfigure.chat.GoogleGenAiChatAutoConfiguration"
})
@Testcontainers
class TaskitApplicationTests {

	@Container
	@ServiceConnection
	static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

	@DynamicPropertySource
	static void overrideDatasource(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", postgres::getJdbcUrl);
		registry.add("spring.datasource.username", postgres::getUsername);
		registry.add("spring.datasource.password", postgres::getPassword);
	}

	@Test
	void contextLoads() {
	}

	@TestConfiguration
	static class TestAiConfig {
		@Bean
		ChatModel chatModel() {
			return Mockito.mock(ChatModel.class);
		}

		@Bean
		ChatClient.Builder chatClientBuilder(ChatModel chatModel) {
			return ChatClient.builder(chatModel);
		}
	}

}
