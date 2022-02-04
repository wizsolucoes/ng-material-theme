import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  chain,
  url,
  apply,
  move,
  forEach,
  mergeWith,
  MergeStrategy,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  NodeDependency,
  NodeDependencyType,
  addPackageJsonDependency,
} from '@schematics/angular/utility/dependencies';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { Schema } from './schema';

let defaultPath: string;

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngMaterialTheme(_options: Schema): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspaceConfigBuffer = tree.read('angular.json');

    if (!workspaceConfigBuffer) {
      throw new SchematicsException('Not an Angular CLI workspace');
    }

    const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
    const projectName = workspaceConfig.defaultProject;

    defaultPath = await createDefaultPath(tree, projectName);

    return chain([
      checkValidProject(),
      addAngularMaterial(_options),
      generateProjectFiles(_options),
      updateStylesFile(_options),
    ]);
  };
}

function checkValidProject() {
  return (tree: Tree, _context: SchematicContext) => {
    const packageFile = tree.read('package.json');
    const angularFile = tree.read('angular.json');

    if (!packageFile || !angularFile) throw new SchematicsException();

    return tree;
  };
}

function addAngularMaterial(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const angularMaterial: NodeDependency = {
      name: '@angular/material',
      type: NodeDependencyType.Default,
      version: '^12.2.13',
    };

    const angularCDK: NodeDependency = {
      name: '@angular/cdk',
      type: NodeDependencyType.Default,
      version: '^12.2.13',
    };

    addPackageJsonDependency(tree, angularMaterial);
    addPackageJsonDependency(tree, angularCDK);

    _context.addTask(new NodePackageInstallTask());
  };
}

function generateProjectFiles(_options: Schema): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const defaultProjectPath = defaultPath;
    const projectPath = defaultProjectPath.replace('src/app', '');

    const appendPath = _options['white-label'] ? '-white-label' : '';

    const sourceTemplates = url(`./files${appendPath}`);

    const sourceParametrizedTemplates = apply(sourceTemplates, [
      move(projectPath),
      _overwriteIfExists(tree),
    ]);

    return mergeWith(sourceParametrizedTemplates, MergeStrategy.Overwrite);
  };
}

function updateStylesFile(_options: Schema) {
  return (tree: Tree, _context: SchematicContext) => {
    const defaultProjectPath = defaultPath;

    const filePath = defaultProjectPath.replace('/app', '/styles.scss');
    const styles = tree.read(filePath)!.toString();

    const updatedStyles = styles.concat(`
// Custom Theming for Angular Material
// For more information: https://material.angular.io/guide/theming
@import '~@angular/material/theming';

// Plus imports for other components in your app.
@import './custom-component-themes.scss';
@import './theme.scss';\n`);

    tree.overwrite(filePath, updatedStyles);

    return tree;
  };
}

function _overwriteIfExists(host: Tree): Rule {
  return forEach((fileEntry) => {
    if (host.exists(fileEntry.path)) {
      host.overwrite(fileEntry.path, fileEntry.content);
      return null;
    }
    return fileEntry;
  });
}
