<?php
/**
 * Training Data CSV Template Export
 * GET /api/training-export.php
 */

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="salesdaddy-training-template.csv"');

echo "category,type,title,keywords,content,language\n";
echo "product,product_info,Product Name,\"price,stock,features\",Bangla product description here,bn\n";
echo "faq,faq,How to order,\"order,কিভাবে অর্ডার করব\",Step by step ordering instructions,bn\n";
echo "greeting,response_template,Customer greeting,\"hello,হ্যালো,নমস্কার\",Assalamu Alaikum welcome message,bn\n";
echo "upsell,response_template,Upsell suggestion,\"extra,অতিরিক্ত,সাথে\",Recommended add-on products,bn\n";
echo "closing,response_template,Order confirmation,\"confirm,অর্ডার কনফার্ম\",Thank you and order summary,bn\n";
