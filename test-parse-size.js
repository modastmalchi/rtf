const s = 'font-size:12pt';
const [key, value] = s.split(':').map(x => x.trim());
console.log('Key:', key);
console.log('Value:', value);
const size = parseInt(value);
console.log('Parsed size:', size);
console.log('isNaN:', isNaN(size));
