import { exec } from '@actions/exec';
import fs from 'node:fs';
import { BuildParameters } from '..';

class SetupWindows {
  public static async setup(buildParameters: BuildParameters) {
    const { targetPlatform } = buildParameters;

    await SetupWindows.setupWindowsRun(targetPlatform);
  }

  private static async setupWindowsRun(targetPlatform: string, silent: boolean = false) {
    if (!fs.existsSync('c:/regkeys')) {
      fs.mkdirSync('c:/regkeys');
    }

    // These all need the Windows 10 SDK
    switch (targetPlatform) {
      case 'StandaloneWindows':
      case 'StandaloneWindows64':
      case 'WSAPlayer':
        await this.generateWinSDKRegKeys(silent);
        break;
      case 'StandaloneLinux64': {
        const command_lin = `"C:/Program Files/Unity Hub/Unity Hub.exe" -- --headless install-modules --version 6000.0.58f2 --module linux-mono`;
        
        // Ignoring return code because the log seems to overflow the internal buffer which triggers
        // a false error
        const errorCode_lin = await exec(command_lin, undefined, {
          silent,
          ignoreReturnCode: true,
        });
        if (errorCode_lin) {
          throw new Error(`There was an error installing the Unity Editor. See logs above for details.`);
        }
        break;
      }
      case 'StandaloneOSX': {
        const command_osx = `"C:/Program Files/Unity Hub/Unity Hub.exe" -- --headless install-modules --version 6000.0.58f2 --module mac-mono`;
    
        // Ignoring return code because the log seems to overflow the internal buffer which triggers
        // a false error
        const errorCode_osx = await exec(command_osx, undefined, {
          silent,
          ignoreReturnCode: true,
        });
        if (errorCode_osx) {
          throw new Error(`There was an error installing the Unity Editor. See logs above for details.`);
        }
        break;
      }
    }
  }

  private static async generateWinSDKRegKeys(silent: boolean = false) {
    // Export registry keys that point to the Windows 10 SDK
    const exportWinSDKRegKeysCommand =
      'reg export "HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Microsoft SDKs\\Windows\\v10.0" c:/regkeys/winsdk.reg /y';
    await exec(exportWinSDKRegKeysCommand, undefined, { silent });
  }
}

export default SetupWindows;
