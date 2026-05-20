const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');

// Helper to recursively find all files in a directory
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'scratch') {
        getFiles(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// 1. Get all image files in img/ and uploads/
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
const imgDir = path.join(projectDir, 'img');
const uploadsDir = path.join(projectDir, 'uploads');

const allImages = [];
if (fs.existsSync(imgDir)) {
  fs.readdirSync(imgDir).forEach(f => {
    if (imageExtensions.includes(path.extname(f).toLowerCase())) {
      allImages.push(`img/${f}`);
    }
  });
}
if (fs.existsSync(uploadsDir)) {
  fs.readdirSync(uploadsDir).forEach(f => {
    if (imageExtensions.includes(path.extname(f).toLowerCase())) {
      allImages.push(`uploads/${f}`);
    }
  });
}

console.log('All image files:', allImages);

// 2. Find references in HTML, JS, CSS files
const codeFiles = getFiles(projectDir).filter(f => {
  const ext = path.extname(f).toLowerCase();
  return ext === '.html' || ext === '.js' || ext === '.css';
});

const references = {};
allImages.forEach(img => {
  references[img] = [];
});

codeFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  allImages.forEach(img => {
    // Simple search
    if (content.includes(img)) {
      references[img].push(path.relative(projectDir, file));
    }
  });
});

console.log('\nImage References in HTML/JS/CSS:');
console.log(JSON.stringify(references, null, 2));
