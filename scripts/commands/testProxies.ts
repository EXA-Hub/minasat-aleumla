import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

/**
 * Tests a single proxy by making an HTTP request through it.
 * @param proxy - The proxy in the format 'ip:port'
 * @returns The proxy string if it works, null if it fails
 */
async function testProxy(proxy: string): Promise<string | null> {
  try {
    const [host, port] = proxy.split(':');
    const response = await axios.get('http://google.com', {
      proxy: {
        host,
        port: parseInt(port, 10),
      },
      timeout: 10000, // 10 seconds timeout
    });
    if (response.status === 200) {
      console.log(`Proxy ${proxy} is working`);
      return proxy;
    } else {
      console.log(`Proxy ${proxy} returned status ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(
      `Proxy ${proxy} failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    return null;
  }
}

/**
 * Splits an array into smaller chunks of a specified size.
 * @param array - The array to split
 * @param size - The size of each chunk
 * @returns An array of chunks
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Main function to read, test, and filter proxies.
 */
async function main() {
  // Define file paths
  const proxiesFile = join(__dirname, '../config/proxies.txt');
  const workingProxiesFile = join(__dirname, 'working_proxies.txt');

  // Read and parse the proxies file
  let fileContent: string;
  try {
    fileContent = readFileSync(proxiesFile, 'utf-8');
  } catch (error) {
    console.error(
      `Error reading proxies file: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    return;
  }
  const proxies = fileContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');

  // Test proxies in batches
  const batchSize = 10;
  const proxyChunks = chunkArray(proxies, batchSize);
  const workingProxies: string[] = [];

  for (const chunk of proxyChunks) {
    const results = await Promise.all(chunk.map(testProxy));
    const working = results.filter(
      (result): result is string => result !== null
    );
    workingProxies.push(...working);
  }

  // Log results
  console.log(
    `\nFound ${workingProxies.length} working proxies out of ${proxies.length} tested.`
  );

  // Save working proxies to a file
  try {
    writeFileSync(workingProxiesFile, workingProxies.join('\n'), 'utf-8');
    console.log(`Working proxies saved to ${workingProxiesFile}`);
  } catch (error) {
    console.error(
      `Error writing working proxies file: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

// Execute the main function and handle any uncaught errors
main().catch((error) =>
  console.error(
    `Unexpected error: ${
      error instanceof Error ? error.message : 'Unknown error'
    }`
  )
);
