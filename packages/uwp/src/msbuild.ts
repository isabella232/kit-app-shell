import { spawn } from 'child_process';

const MSBUILD_PATH
    = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\MSBuild\\15.0\\Bin\\MsBuild.exe';
const DEV_ENV_DIR = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\Common7\\IDE';

export interface IMSBuildOptions {
    msbuildPath? : string;
    release? : boolean;
}

export function buildUWPApp(dir : string, options? : IMSBuildOptions) {
    const { release, msbuildPath } = options;
    return new Promise((resolve, reject) => {
        const args = ['-verbosity:minimal'];
        if (release) {
            args.push('/p:Configuration=Release');
        }
        const p = spawn(msbuildPath || MSBUILD_PATH, args, {
            cwd: dir,
            env: Object.assign({ DevEnvDir: DEV_ENV_DIR }, process.env),
            stdio: 'inherit',
        });

        p.on('close', () => {
            resolve();
        });
        p.on('error', (e) => {
            reject(e);
        });
    });
}
