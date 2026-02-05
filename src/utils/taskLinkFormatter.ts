/**
 * OmniFocus タスクリンクフォーマッター
 * タスクIDからOmniFocusで開くためのリンクを生成する
 */
export function formatTaskLink(taskId: string): string {
  if (!taskId) return '';
  return `[開く](omnifocus:///task/${taskId})`;
}
