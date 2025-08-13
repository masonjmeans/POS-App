7:03:26 PM: Netlify Build                                                 
7:03:26 PM: ────────────────────────────────────────────────────────────────
7:03:26 PM: ​
7:03:26 PM: ❯ Version
7:03:26 PM:   @netlify/build 35.0.5
7:03:26 PM: ​
7:03:26 PM: ❯ Flags
7:03:26 PM:   accountId: 685c97ee96b88db7c9fc0834
7:03:26 PM:   baseRelDir: true
7:03:26 PM:   buildId: 689be43f5c97cf0008712615
7:03:26 PM:   deployId: 689be43f5c97cf0008712617
7:03:26 PM: ​
7:03:26 PM: ❯ Current directory
7:03:26 PM:   /opt/build/repo
7:03:26 PM: ​
7:03:26 PM: ❯ Config file
7:03:26 PM:   No config file was defined: using default values.
7:03:26 PM: ​
7:03:26 PM: ❯ Context
7:03:26 PM:   production
7:03:26 PM: ​
7:03:26 PM: Build command from Netlify app                                
7:03:26 PM: ────────────────────────────────────────────────────────────────
7:03:26 PM: ​
7:03:26 PM: $ npm run build
7:03:27 PM: > pos-stand-app@0.1.0 build
7:03:27 PM: > react-scripts build
7:03:28 PM: Creating an optimized production build...
7:03:41 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2
7:03:40 PM: 
7:03:40 PM: Treating warnings as errors because process.env.CI = true.
7:03:40 PM: Most CI servers set it automatically.
7:03:40 PM: 
7:03:40 PM: Failed to compile.
7:03:40 PM: 
7:03:40 PM: [eslint]
7:03:40 PM: src/App.js
7:03:40 PM:   Line 4:91:   'getDocs' is defined but never used                                                                           no-unused-vars
7:03:40 PM:   Line 5:128:  'Brush' is defined but never used                                                                             no-unused-vars
7:03:40 PM:   Line 520:6:  React Hook useEffect has a missing dependency: 'fetchData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
7:03:40 PM: ​
7:03:40 PM: "build.command" failed                                        
7:03:40 PM: ────────────────────────────────────────────────────────────────
7:03:40 PM: ​
7:03:40 PM:   Error message
7:03:40 PM:   Command failed with exit code 1: npm run build
7:03:40 PM: ​
7:03:40 PM:   Error location
7:03:40 PM:   In Build command from Netlify app:
7:03:40 PM:   npm run build
7:03:40 PM: ​
7:03:40 PM:   Resolved config
7:03:40 PM:   build:
7:03:40 PM:     command: npm run build
7:03:40 PM:     commandOrigin: ui
7:03:40 PM:     publish: /opt/build/repo/build
7:03:40 PM:     publishOrigin: ui
7:03:41 PM: Build failed due to a user error: Build script returned non-zero exit code: 2
7:03:41 PM: Failing build: Failed to build site
7:03:42 PM: Finished processing build request in 42.493s
