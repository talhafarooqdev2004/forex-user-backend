import { resolve as resolveMeta } from 'import-meta-resolve';
import { pathToFileURL } from 'url';
import * as fs from 'fs';
import * as path from 'path';

// Get the base directory of the project
const packagePath = path.resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Get the aliases from package.json
const aliases = packageJson._moduleAliases || {};
const baseURL = pathToFileURL(process.cwd() + '/').href;

// ... (imports and initial setup are correct)

// The main 'resolve' hook for the Node.js loader API
export async function resolve(specifier, context, nextResolve) {
    const { parentURL } = context;

    // 1. Check for Aliases
    for (const [alias, targetPath] of Object.entries(aliases)) {
        if (specifier.startsWith(alias)) {
            // ... (alias logic)
            // ... (successful resolveMeta returns)

            // NOTE: The issue is likely when an alias is found, but the 
            // `try...catch` block throws, preventing a successful return.
            // If the error in `try...catch` is caught, it is re-thrown (`throw error;`), 
            // which is correct for signalling failure.

            // If the code reaches here and returns, it short-circuits correctly.
            // The structure is generally correct for the alias logic.

            const newSpecifier = specifier.replace(alias, targetPath);
            const moduleURL = new URL(newSpecifier, baseURL).href;

            try {
                const resolved = resolveMeta(moduleURL, baseURL);
                return {
                    url: resolved,
                    format: 'module',
                    // Add shortCircuit: true to explicitly tell Node.js 
                    // the resolution is complete and no further loaders should run.
                    shortCircuit: true
                };
            } catch (error) {
                // If the alias resolution fails (e.g., file not found),
                // it's best to fall through to the next resolver chain 
                // to see if the default Node.js resolution can find it, 
                // UNLESS you are absolutely sure the alias must be resolved.

                // For a robust setup, if `resolveMeta` fails, you should probably 
                // just let the next resolver handle the original specifier.
                // However, since we've modified the specifier, we should 
                // re-throw or move on. Let's *skip* the alias for this one specifier 
                // if it fails to resolve *after* replacement.

                // For now, let's keep the throw for debugging, as it matches your original attempt:
                console.error(`Alias resolution failed for: ${specifier} -> ${moduleURL}`, error);
                throw error; // This correctly halts the loader and crashes the app, but doesn't cause ERR_LOADER_CHAIN_INCOMPLETE on its own.
            }
        }
    }

    // 2. Pass to next resolver (for non-aliased imports or relative paths)
    // This is the CRITICAL line that must be reached for non-aliased imports.
    return nextResolve(specifier, context);
}

// ... (load and globalPreload hooks are correct)