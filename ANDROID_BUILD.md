# Building the GramTrack Android APK with Capacitor

This guide provides instructions for building and running the GramTrack Field Inspector application on Android physical devices and emulators.

---

## 1. Prerequisites (Windows 11)

1. **Node.js LTS** (v18.x or v20.x).
2. **Android Studio** (Flamingo / Giraffe / Hedgehog or newer):
   - Install Android SDK Platform-Tools.
   - Install Android SDK Build-Tools (API Level 33 or 34).
   - Install Android SDK Command-line Tools.
3. **Java Development Kit (JDK 17)**: Ensure `JAVA_HOME` environment variable is set.
4. **Android Device or Emulator**:
   - Physical device with USB Debugging enabled in Developer Options, or
   - Android Virtual Device (AVD) configured in Android Studio.

---

## 2. Configuration (`capacitor.config.ts`)

The project includes `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gov.in.gramtrack.inspector',
  appName: 'GramTrack Field Inspector',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
```

---

## 3. Build Steps (PowerShell Commands)

### Step 1: Install Capacitor CLI & Core
```powershell
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Build the Production Web Bundle
```powershell
npm run build
```

### Step 3: Add the Android Platform
```powershell
npx cap add android
```
*(This creates an `android/` directory with a standard Gradle Android project.)*

### Step 4: Synchronize Code and Assets
```powershell
npx cap sync android
```

### Step 5: Open in Android Studio
```powershell
npx cap open android
```

---

## 4. Generating the APK

1. In Android Studio, wait for Gradle sync to complete.
2. From the top menu, navigate to:
   **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Once completed, click the **"locate"** link in the bottom-right notification popup to retrieve your debug APK:
   `android/app/build/outputs/apk/debug/app-debug.apk`.
4. Install on your Android device using ADB:
   ```powershell
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 5. Network & API Connectivity Note

When testing from an Android emulator or device:
- Android emulators access the host machine's `localhost` via `10.0.2.2`.
- Physical devices require the local Wi-Fi IP address of your development machine (e.g., `http://192.168.1.100:3000`).
- Ensure Windows Firewall allows inbound connections on port 3000 if testing with a physical device.
