package com.iamak.taskit.service;

import com.iamak.taskit.model.User;
import com.iamak.taskit.model.XpEvent;
import com.iamak.taskit.model.XpSourceType;
import com.iamak.taskit.repository.XpEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class XpService {

    private final XpEventRepository xpEventRepository;

    public XpService(XpEventRepository xpEventRepository) {
        this.xpEventRepository = xpEventRepository;
    }

    @Transactional
    public void addXp(User user, XpSourceType sourceType, Long sourceId, int xp) {
        String localDateKey = ZonedDateTime.now(java.time.ZoneId.of(user.getTimezone()))
                .format(DateTimeFormatter.ISO_LOCAL_DATE);

        xpEventRepository.save(XpEvent.builder()
                .user(user)
                .sourceType(sourceType)
                .sourceId(sourceId)
                .xp(xp)
                .localDateKey(localDateKey)
                .build());
    }
}
