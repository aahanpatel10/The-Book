const { spawn } = require('child_process');

const vars = [
    ['NEXT_PUBLIC_FIREBASE_API_KEY', 'AIzaSyDHb6jlUrZcRk4Kwc2KnTzdBeab4MgAirA'],
    ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'the-books-admin-75c0d.firebaseapp.com'],
    ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'the-books-admin-75c0d'],
    ['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'the-books-admin-75c0d.firebasestorage.app'],
    ['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', '156722692499'],
    ['NEXT_PUBLIC_FIREBASE_APP_ID', '1:156722692499:web:b75b1a88a30950accde866']
];

async function addVar(name, value) {
    return new Promise((resolve) => {
        console.log(`\n--- Adding ${name} ---`);
        const child = spawn('vercel', ['env', 'add', name, 'production', '--yes'], {
            shell: true,
            stdio: ['pipe', 'pipe', 'inherit']
        });

        child.stdout.on('data', (data) => {
            const output = data.toString();
            process.stdout.write(output);

            if (output.includes('Mark as sensitive?')) {
                child.stdin.write('n\n');
            } else if (output.includes('value of')) {
                child.stdin.write(value + '\n');
                child.stdin.end();
            }
        });

        child.on('close', (code) => {
            console.log(`Finished ${name} with code ${code}`);
            resolve();
        });
    });
}

(async () => {
    for (const [name, value] of vars) {
        await addVar(name, value);
    }
    console.log('\nAll done!');
})();
