package com.investigation.dms;

import com.investigation.dms.util.HashUtil;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class HashUtilTest {

    @Test
    void sha256ProducesKnownDigestForEmptyString() {
        // Well-known SHA-256 of the empty string.
        assertEquals("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                HashUtil.sha256(""));
    }

    @Test
    void sha256IsDeterministic() {
        assertEquals(HashUtil.sha256("hello world"), HashUtil.sha256("hello world"));
    }

    @Test
    void sha256ChangesWhenContentChanges() {
        assertNotEquals(HashUtil.sha256("evidence-A"), HashUtil.sha256("evidence-B"));
    }
}
