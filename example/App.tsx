import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { restart } from 'react-native-restart-app';

// ---------------------------------------------------------------------------
// Session counter — increments every time the app mounts. After a restart
// it resets to 1 (new process, clean JS heap), which confirms the restart
// actually happened rather than a simple in-process reload.
// ---------------------------------------------------------------------------

let sessionCount = 0;

export default function App() {
  sessionCount += 1;

  const [log, setLog] = useState<string[]>([]);

  const appendLog = useCallback((message: string) => {
    setLog(prev => [`[${timestamp()}] ${message}`, ...prev].slice(0, 20));
  }, []);

  const handleRestart = useCallback(() => {
    appendLog('restart() called — app is restarting…');
    // Give the log entry a render cycle before handing control to native.
    setTimeout(restart, 80);
  }, [appendLog]);

  const handleLanguageChange = useCallback(() => {
    appendLog('Simulated language change → restarting to apply');
    setTimeout(restart, 80);
  }, [appendLog]);

  const handleThemeChange = useCallback(() => {
    appendLog('Simulated theme change → restarting to apply');
    setTimeout(restart, 80);
  }, [appendLog]);

  const handleConfigReload = useCallback(() => {
    appendLog('Remote config fetched → restarting to apply');
    setTimeout(restart, 80);
  }, [appendLog]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>react-native-restart-app</Text>
        <Text style={styles.headerSub}>v1.x — RN 0.86 · New Architecture</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Session badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Session</Text>
          <Text style={styles.badgeValue}>#{sessionCount}</Text>
          <Text style={styles.badgeHint}>
            This counter resets to 1 after each restart — confirming a full
            process restart occurred.
          </Text>
        </View>

        {/* Primary action */}
        <Section title="Basic Restart">
          <ActionButton
            label="Restart App"
            description="Performs a full process restart immediately."
            color={COLORS.primary}
            onPress={handleRestart}
          />
        </Section>

        {/* Real-world use cases */}
        <Section title="Use Cases">
          <ActionButton
            label="Change Language"
            description="Restart after applying a new locale so all translated strings reload."
            color={COLORS.green}
            onPress={handleLanguageChange}
          />
          <ActionButton
            label="Switch Theme"
            description="Restart after persisting a new theme to apply native-level styling."
            color={COLORS.purple}
            onPress={handleThemeChange}
          />
          <ActionButton
            label="Apply Remote Config"
            description="Restart after fetching new feature-flag configuration."
            color={COLORS.orange}
            onPress={handleConfigReload}
          />
        </Section>

        {/* Platform & architecture info */}
        <Section title="Environment">
          <InfoRow label="Platform" value={Platform.OS === 'ios' ? 'iOS' : 'Android'} />
          <InfoRow label="OS Version" value={String(Platform.Version)} />
          <InfoRow
            label="Architecture"
            value={
              // global.__turboModuleProxy exists only in New Architecture
              (global as Record<string, unknown>).__turboModuleProxy
                ? 'New Architecture (TurboModules)'
                : 'Old Architecture (Bridge)'
            }
          />
          <InfoRow
            label="JS Engine"
            value={
              (global as Record<string, unknown>).HermesInternal ? 'Hermes' : 'JSC'
            }
          />
        </Section>

        {/* Event log */}
        {log.length > 0 && (
          <Section title="Event Log">
            {log.map((entry, i) => (
              <Text key={i} style={styles.logEntry}>
                {entry}
              </Text>
            ))}
          </Section>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ActionButton({
  label,
  description,
  color,
  onPress,
}: {
  label: string;
  description: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
      <Text style={styles.buttonDesc}>{description}</Text>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timestamp() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const COLORS = {
  primary: '#6200EE',
  green: '#00897B',
  purple: '#7B1FA2',
  orange: '#E65100',
  bg: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  subtext: '#757575',
  border: '#E0E0E0',
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  scroll: {
    backgroundColor: COLORS.bg,
    paddingBottom: 32,
  },
  badge: {
    margin: 16,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeLabel: {
    fontSize: 12,
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeValue: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.primary,
    lineHeight: 64,
  },
  badgeHint: {
    fontSize: 12,
    color: COLORS.subtext,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  sectionBody: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    lineHeight: 17,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  logEntry: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: COLORS.text,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
});
