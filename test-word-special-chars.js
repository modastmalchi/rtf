/**
 * تست استاندارد کاراکترهای خاص ورد (Ctrl+Shift+8)
 * این فایل همه کاراکترهای خاص که در Microsoft Word نمایش داده می‌شوند را تست می‌کند
 */

const { rtfToHtml } = require('./lib/rtf-converter.js');

console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║   تست کاراکترهای خاص ورد (Microsoft Word Special Characters)   ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

const tests = [
  {
    name: 'Space (فاصله معمولی)',
    rtf: String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 Arial;}}
\pard Hello World\par
}`,
    expectedInHtml: '&nbsp;',
    description: 'فاصله معمولی باید به &nbsp; تبدیل شود'
  },
  {
    name: 'Tab (تب)',
    rtf: String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 Arial;}}
\pard Before\tab After\par
}`,
    expectedInHtml: '&nbsp;',
    description: 'تب باید به 8 فاصله تبدیل شود'
  },
  {
    name: 'Line Break (شکست خط)',
    rtf: String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 Arial;}}
\pard First Line\line Second Line\par
}`,
    expectedInHtml: '<br/>',
    description: 'شکست خط باید به <br/> تبدیل شود'
  },
  {
    name: 'Non-breaking Space (فاصله بدون شکست)',
    rtf: String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 Arial;}}
\pard No~Break~Space\par
}`,
    expectedInHtml: '&nbsp;',
    description: 'فاصله بدون شکست (~) باید به &nbsp; تبدیل شود'
  },
  {
    name: 'Optional Hyphen (خط تیره شرطی)',
    rtf: String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 Arial;}}
\pard super\-cali\-fragil\-istic\par
}`,
    expectedInHtml: '&shy;',
    description: 'خط تیره شرطی (\\-) برای شکستن کلمات طولانی'
  },
  {
    name: 'Non-breaking Hyphen (خط تیره بدون شکست)',
    rtf: String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 Arial;}}
\pard 555\_1234\par
}`,
    expectedInHtml: '&#8209;',
    description: 'خط تیره بدون شکست (\\_) برای جلوگیری از شکستن'
  },
  {
    name: 'Page Break (شکست صفحه)',
    rtf: String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 Arial;}}
\pard Page One\page Page Two\par
}`,
    expectedInHtml: 'page-break',
    description: 'شکست صفحه برای جداسازی صفحات'
  },
  {
    name: 'ZWNJ (نیم‌فاصله فارسی)',
    rtf: String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 Arial;}}
\pard \u8204?می\u8204?آید\par
}`,
    expectedInHtml: '&zwnj;',
    description: 'نیم‌فاصله (ZWNJ) برای متون فارسی'
  },
  {
    name: 'Combined Test (تست ترکیبی)',
    rtf: String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 B Nazanin;}}
\pard متن~فارسی با\tab تب\line و شکست\-خط\par
}`,
    expectedInHtml: ['&nbsp;', '&shy;', '<br/>'],
    description: 'ترکیب چندین کاراکتر خاص در یک متن'
  }
];

let passedTests = 0;
let failedTests = 0;

tests.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  console.log('   ' + '─'.repeat(60));
  
  const html = rtfToHtml(test.rtf);
  const expected = Array.isArray(test.expectedInHtml) ? test.expectedInHtml : [test.expectedInHtml];
  const passed = expected.every(exp => html.includes(exp));
  
  if (passed) {
    console.log('   ✅ موفق:', test.description);
    passedTests++;
  } else {
    console.log('   ❌ ناموفق:', test.description);
    failedTests++;
  }
  
  console.log('   HTML:', html.substring(0, 100) + (html.length > 100 ? '...' : ''));
});

console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
console.log(`║                         نتیجه نهایی                              ║`);
console.log('╠═══════════════════════════════════════════════════════════════════╣');
console.log(`║   تست‌های موفق: ${passedTests}/${tests.length}                                          ║`);
console.log(`║   تست‌های ناموفق: ${failedTests}/${tests.length}                                         ║`);
console.log(`║   درصد موفقیت: ${Math.round(passedTests * 100 / tests.length)}%                                          ║`);
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

if (failedTests === 0) {
  console.log('🎉 همه تست‌ها با موفقیت انجام شدند!');
} else {
  console.log('⚠️  برخی تست‌ها ناموفق بودند. لطفاً بررسی کنید.');
}
