{
  /**    
    用来生成测试的用户数据
    安装好nodejs后，切换到本文件目录下执行：
    node reduce_user.js 用户数量 文件名.json
    eg: node reduce_user.js 200 users_200.json
*/
}
import { promises as fs } from "fs";
import path from "path";

// 获取当前目录的绝对路径
const __dirname = path.resolve();

// 从 sample.json 读取数据
const readData = async () => {
  const dataPath = path.join(__dirname, "../sample_users.json");
  const data = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(data);
};

// 主函数
const main = async () => {
  const args = process.argv.slice(2);
  const count = parseInt(args[0], 10);
  const filename = args[1];

  // 检查输入有效性
  if (isNaN(count) || count < 0) {
    console.error("数量参数必须是非负整数。");
    process.exit(1);
  }

  if (!filename) {
    console.error("请提供文件名参数。");
    process.exit(1);
  }

  try {
    const data = await readData();

    // 调整数组长度
    const adjustedData = data.slice(0, count);

    // 写入文件
    await fs.writeFile(
      path.join(__dirname, "../", filename),
      JSON.stringify(adjustedData, null, 2)
    );
    console.log(`成功将数据写入 ${filename}`);
  } catch (err) {
    console.error("处理过程中出错:", err);
  }
};

// 执行主函数
main();
