const path = require('path');

module.exports = {
  entry: './src/script.js', // File masuk
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Output ke folder dist
  },
  mode: 'development', // Gunakan 'production' saat build untuk produksi
  devServer: {
    static: path.join(__dirname, 'dist'), // Menggantikan contentBase
    compress: true,
    port: 9000,
    open: true, // Buka browser secara otomatis
    historyApiFallback: true, // Agar aplikasi SPA tetap bisa diakses
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Untuk semua file .js
        exclude: /node_modules/, // Kecualikan folder node_modules
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Gunakan preset-env Babel
          },
        },
      },
      {
        test: /\.css$/, // Pastikan ini ada
        use: ['style-loader', 'css-loader'], // Loader untuk CSS
      },
    ],
  },
};
