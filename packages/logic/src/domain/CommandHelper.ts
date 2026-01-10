import { Command } from "./Command.js";
import * as Commands from "./commands/index.js";

/**
 * 커맨드 인스턴스 관리 헬퍼
 * 시스템 내의 모든 게임 커맨드 객체를 등록하고 이름으로 조회할 수 있는 기능을 제공합니다.
 */
export class CommandHelper {
  /** actionName을 키로 하는 커맨드 인스턴스 맵 */
  private static commands: Map<string, Command> = new Map();

  static {
    // 모든 커맨드 클래스를 순회하며 인스턴스화하여 등록
    for (const CommandClass of Object.values(Commands)) {
      try {
        const instance = new (CommandClass as any)();
        if (instance.actionName) {
          this.commands.set(instance.actionName, instance);
        }
      } catch (e) {
        // 생성자가 인자를 필요로 하는 특수 커맨드는 수동 등록 프로세스가 필요할 수 있음
      }
    }
  }

  /**
   * 행동 이름(actionName)으로 등록된 커맨드 객체를 조회합니다.
   * 
   * @param actionName 조회할 커맨드 이름
   * @returns 해당 커맨드 객체 또는 undefined
   */
  public static getCommand(actionName: string): Command | undefined {
    return this.commands.get(actionName);
  }
}
