const nextConfig = { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true }, images: { remotePatterns: [ { protocol: 'https', hostname: '**.supabase.co' }, { protocol: 'https', hostname: 'me.sogang.ac.kr' } ] } };
export default nextConfig;
