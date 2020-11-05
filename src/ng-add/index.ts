import {
  chain,
  Rule,
  SchematicContext,
  Tree,
  schematic
} from '@angular-devkit/schematics';

export function ngAdd(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return chain([
      schematic('ng-material-theme', options),
    ])(tree, _context);
  }
}
