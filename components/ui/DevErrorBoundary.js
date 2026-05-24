import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Only active in __DEV__ mode — stripped in production builds
export default class DevErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[DevErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (!this.state.error || !__DEV__) return this.props.children;

    const { error } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔴 Runtime Error</Text>
        <Text style={styles.message}>{error.message}</Text>
        <ScrollView style={styles.stack}>
          <Text style={styles.stackText}>{error.stack}</Text>
        </ScrollView>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.setState({ error: null })}
        >
          <Text style={styles.buttonText}>Dismiss & Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: "#ff5555",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  message: {
    color: "#ffdd57",
    fontSize: 15,
    marginBottom: 16,
    fontFamily: "monospace",
  },
  stack: {
    flex: 1,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  stackText: {
    color: "#aaaaaa",
    fontSize: 11,
    fontFamily: "monospace",
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
